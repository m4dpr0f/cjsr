import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PixelButton } from "@/components/ui/pixel-button";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface FactionStat {
  faction: string;
  name: string;
  color: string;
  totalXp: number;
  topPlayer: string | null;
  topPlayerWpm: number;
  topPlayerAccuracy: number;
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

// Placeholder avatar component that handles HTML avatars
const PlayerAvatar = ({ chickenType }: { chickenType: string }) => {
  if (chickenType.startsWith('html_')) {
    return (
      <div 
        className="w-10 h-10 rounded-full bg-dark-700 overflow-hidden flex items-center justify-center"
        dangerouslySetInnerHTML={{ 
          __html: `
            <div class="chicken-avatar ${chickenType.replace('html_', '')}" 
                 style="width: 100%; height: 100%; transform: scale(1.2);">
            </div>
          ` 
        }}
      />
    );
  }
  
  return (
    <div className="w-10 h-10 rounded-full bg-dark-700 overflow-hidden flex items-center justify-center">
      <div className={`w-8 h-8 ${chickenType}`}></div>
    </div>
  );
};

interface LeaderboardPlayer {
  id: number;
  username: string;
  rank: number;
  avg_wpm: number;
  accuracy: number;
  races_won: number;
  total_races: number;
  win_rate: number;
  xp: number;
  chicken_name: string;
  chicken_type: string;
  jockey_type: string;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardPlayer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<string>("avg_wpm");
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const { toast } = useToast();
  
  // Set document title
  useEffect(() => {
    document.title = "Leaderboard - Chicken Jockey Scribe Racer";
  }, []);
  
  // Fetch leaderboard data
  const { data, isLoading, isError, refetch } = useQuery<LeaderboardResponse>({
    queryKey: ['/api/leaderboard', sortBy, limit, offset],
    queryFn: () => 
      apiRequest(
        "GET", 
        `/api/leaderboard?sort=${sortBy}&limit=${limit}&offset=${offset}`
      ).then(res => res.json()),
    staleTime: 0, // Always refetch to show latest stats
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Fetch faction war data for the faction stats table
  const { data: factionData, isLoading: factionLoading } = useQuery({
    queryKey: ['/api/stats/factions'],
  });

  const factionTotals = (factionData as { factions?: FactionStat[] })?.factions || [];
  const sortedFactions = [...factionTotals].sort((a, b) => b.totalXp - a.totalXp);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setOffset(0); // Reset to first page when changing sort
  };
  
  // Handle pagination
  const handleNextPage = () => {
    if (data?.pagination.hasMore) {
      setOffset(offset + limit);
    }
  };
  
  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };
  
  // Show player details in a modal
  const handleShowPlayerDetails = (player: LeaderboardPlayer) => {
    toast({
      title: `${player.username}'s Stats`,
      description: (
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <PlayerAvatar chickenType={player.chicken_type} />
            <div>
              {player.chicken_name && player.chicken_name !== 'GARU CHICK' && (
                <div className="font-bold">{player.chicken_name}</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Average WPM:</div>
            <div className="font-bold">{player.avg_wpm}</div>
            <div>Accuracy:</div>
            <div className="font-bold">{player.accuracy}%</div>
            <div>Races Won:</div>
            <div className="font-bold">{player.races_won}</div>
            <div>Total Races:</div>
            <div className="font-bold">{player.total_races}</div>
            <div>Win Rate:</div>
            <div className="font-bold">{player.win_rate}%</div>
            <div>Experience:</div>
            <div className="font-bold">{player.xp} XP</div>
          </div>
        </div>
      ),
      duration: 5000,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-white">
      <Header />
      
      <main className="flex-grow container mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-minecraft text-primary mb-4 md:mb-0">GLOBAL LEADERBOARD</h1>
          <div className="flex gap-2">
            <PixelButton 
              onClick={() => window.location.href = '/profile'}
              variant="outline"
              className="bg-primary/20 border-primary text-primary hover:bg-primary/40"
            >
              📊 View My Profile
            </PixelButton>
            <PixelButton 
              onClick={() => window.location.href = '/faction-war'}
              variant="outline"
              className="bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600/40"
            >
              ⚔️ Faction War Rankings
            </PixelButton>
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48 bg-dark-800 border-primary/50">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-primary/50">
                <SelectItem value="avg_wpm">Average WPM</SelectItem>
                <SelectItem value="xp">Experience Points</SelectItem>
                <SelectItem value="accuracy">Accuracy</SelectItem>
                <SelectItem value="races_won">Races Won</SelectItem>
                <SelectItem value="win_rate">Win Rate</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-32 bg-dark-800 border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-800 border-primary/50">
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <PixelButton onClick={() => refetch()} variant="outline" size="sm">
            Refresh
          </PixelButton>
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden bg-dark-800 border-none shadow-lg">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 p-4 font-minecraft text-secondary text-xs uppercase bg-dark-900">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-center">Avg WPM</div>
            <div className="col-span-2 text-center">Accuracy</div>
            <div className="col-span-2 text-center">Races Won</div>
            <div className="col-span-2 text-center">XP</div>
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="font-minecraft text-primary">Loading leaderboard...</div>
            </div>
          )}
          
          {/* Error state */}
          {isError && (
            <div className="p-8 text-center">
              <div className="font-minecraft text-red-400">Failed to load leaderboard</div>
              <PixelButton onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                Try Again
              </PixelButton>
            </div>
          )}
          
          {/* Data display */}
          {data && data.leaderboard.length > 0 ? (
            <div className="divide-y divide-dark-700">
              {data.leaderboard.map((player, index) => (
                <div 
                  key={player.id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-dark-700 cursor-pointer transition-colors"
                  onClick={() => handleShowPlayerDetails(player)}
                >
                  <div className="col-span-1 font-minecraft text-primary text-center">
                    #{offset + index + 1}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <PlayerAvatar chickenType={player.chicken_type} />
                    <div>
                      <div className="font-bold">{player.username}</div>
                      {player.chicken_name && player.chicken_name !== 'GARU CHICK' && (
                        <div className="text-xs text-gray-400">{player.chicken_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-center font-bold">
                    {player.avg_wpm || 0} WPM
                  </div>
                  <div className="col-span-2 text-center">
                    {player.accuracy || 0}%
                  </div>
                  <div className="col-span-2 text-center">
                    {player.races_won || 0}
                  </div>
                  <div className="col-span-2 text-center font-minecraft text-primary">
                    {player.xp || 0} XP
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <div className="font-minecraft text-gray-400 mb-4">No racers yet!</div>
              <div className="text-sm text-gray-500 mb-4">Be the first to appear on the leaderboard</div>
              <PixelButton 
                onClick={() => window.location.href = '/multiplayer/race'} 
                variant="default" 
                size="lg"
              >
                Start Racing
              </PixelButton>
            </div>
          ) : null}
          
          {/* Pagination */}
          {data && data.pagination.total > limit && (
            <div className="p-4 bg-dark-900 flex justify-between items-center">
              <PixelButton 
                onClick={handlePrevPage} 
                disabled={offset === 0}
                variant="outline" 
                size="sm"
              >
                Previous
              </PixelButton>
              
              <div className="font-minecraft text-sm text-gray-400">
                Showing {offset + 1}-{Math.min(offset + limit, data.pagination.total)} of {data.pagination.total}
              </div>
              
              <PixelButton 
                onClick={handleNextPage} 
                disabled={!data.pagination.hasMore}
                variant="outline" 
                size="sm"
              >
                Next
              </PixelButton>
            </div>
          )}
        </Card>

        {/* Faction War Statistics Table */}
        {!factionLoading && sortedFactions.length > 0 && (
          <Card className="mt-8 overflow-hidden bg-dark-800 border-none shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-minecraft text-primary">⚔️ FACTION WAR STANDINGS</h2>
                <PixelButton 
                  onClick={() => window.location.href = '/faction-war'}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600/40"
                >
                  View Details
                </PixelButton>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 px-3 text-yellow-400 font-minecraft">RANK</th>
                      <th className="text-left py-2 px-3 text-yellow-400 font-minecraft">FACTION</th>
                      <th className="text-right py-2 px-3 text-yellow-400 font-minecraft">TOTAL XP</th>
                      <th className="text-right py-2 px-3 text-yellow-400 font-minecraft">PLAYERS</th>
                      <th className="text-left py-2 px-3 text-yellow-400 font-minecraft">TOP CONTRIBUTOR</th>
                      <th className="text-left py-2 px-3 text-yellow-400 font-minecraft">MOUNT</th>
                      <th className="text-right py-2 px-3 text-yellow-400 font-minecraft">FACTION XP</th>
                      <th className="text-right py-2 px-3 text-yellow-400 font-minecraft">WPM</th>
                      <th className="text-right py-2 px-3 text-yellow-400 font-minecraft">ACC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFactions.slice(0, 8).map((faction, index) => {
                      const info = FACTION_INFO[faction.faction as keyof typeof FACTION_INFO];
                      const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                      return (
                        <tr key={faction.faction} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                          <td className="py-2 px-3">
                            <span className="text-lg">{rankEmoji}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2">
                              <div 
                                className={`w-3 h-3 rounded border ${faction.faction === 'd8' ? 'border-gray-400' : 'border-gray-600'}`}
                                style={{ backgroundColor: info.color }}
                              ></div>
                              <span className="text-white font-minecraft text-sm">
                                {info.emoji} {info.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-primary font-bold text-sm">
                              {formatNumber(faction.totalXp)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300 text-sm">
                            {faction.playerCount}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-white text-sm">
                              {faction.topPlayer || 'None'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-yellow-400 text-sm font-medium">
                              {(faction as any).topPlayerMount || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-orange-400 font-bold text-sm">
                              {formatNumber((faction as any).topPlayerFactionXp || 0)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-green-400 font-bold text-sm">
                              {faction.topPlayerWpm || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="text-blue-400 font-bold text-sm">
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
          </Card>
        )}
        
        {/* TypeRacer-like explanation */}
        <div className="mt-8 bg-dark-800 p-4 rounded-lg shadow text-sm">
          <h2 className="font-minecraft text-primary mb-2">ABOUT THE LEADERBOARD</h2>
          <p className="mb-2">The leaderboard ranks players based on their typing performance in races.</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li><span className="text-primary font-bold">Average WPM</span>: Words per minute across all races</li>
            <li><span className="text-primary font-bold">Accuracy</span>: Percentage of correct keystrokes</li>
            <li><span className="text-primary font-bold">Races Won</span>: Total number of multiplayer races won</li>
            <li><span className="text-primary font-bold">Win Rate</span>: Percentage of races won out of total races</li>
          </ul>
          <p className="mt-2">Click on any player to see more detailed statistics!</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}