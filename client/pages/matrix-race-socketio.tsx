import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMatrixSocketIO } from '@/hooks/useMatrixSocketIO';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChickenAvatar } from '@/components/ui/chicken-avatar';
import matrixFederationImg from '@assets/CJSR Matrix Logo.png';

// Faction Wars Leaderboard Component
function FactionWarsLeaderboard({ factionStats }: { factionStats: any }) {
  const factionColors = {
    d2: 'bg-yellow-600',
    d4: 'bg-red-600',
    d6: 'bg-green-600',
    d8: 'bg-blue-600',
    d10: 'bg-purple-600',
    d12: 'bg-pink-600',
    d20: 'bg-cyan-600',
    d100: 'bg-orange-600'
  };

  const factionNames = {
    d2: '💰 Coin',
    d4: '🔥 Fire',
    d6: '🌍 Earth', 
    d8: '💨 Air',
    d10: '⚡ Chaos',
    d12: '✨ Ether',
    d20: '🌊 Water',
    d100: '⚖️ Order'
  };

  if (!factionStats?.factions) return null;

  return (
    <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-transparent bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text font-mono">
          ⚔️ FACTION WARS
        </CardTitle>
        <p className="text-cyan-300 text-sm font-mono">Updates every 4 minutes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {factionStats.factions.slice(0, 8).map((faction: any, index: number) => (
            <div key={faction.faction} className="flex items-center justify-between p-2 bg-black/40 border border-cyan-500/20 rounded backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Badge className={`${factionColors[faction.faction as keyof typeof factionColors]} text-white px-2 py-1 text-xs`}>
                  #{index + 1}
                </Badge>
                <div className="text-white text-sm font-medium">
                  {factionNames[faction.faction as keyof typeof factionNames]}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{faction.totalXp?.toLocaleString() || 0}</div>
                  <div className="text-gray-400">{faction.playerCount || 0} members</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-medium">{faction.topPlayer || 'None'}</div>
                  <div className="text-yellow-400 font-medium">{faction.topPlayerMount || '-'}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold">{faction.topPlayerFactionXp?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Overall Top 8 Leaderboard Component  
function OverallLeaderboard({ leaderboard }: { leaderboard: any }) {
  if (!leaderboard?.leaderboard) return null;

  const factionEmojis: { [key: string]: string } = {
    'd2': '💰', 'd4': '🔥', 'd6': '🌱', 'd8': '💨',
    'd10': '⚡', 'd12': '✨', 'd20': '🌊', 'd100': '⚖️'
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">🏆 Top Scribes</CardTitle>
        <p className="text-gray-400 text-sm">Updates every 4 minutes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.leaderboard.slice(0, 10).map((player: any, index: number) => (
            <div key={player.username} className="flex items-center justify-between p-2 bg-gray-800 border border-gray-600 rounded">
              <div className="flex items-center gap-2">
                <Badge className={`${index < 3 ? 'bg-yellow-600' : 'bg-gray-600'} text-white px-2 py-1 text-xs`}>
                  #{index + 1}
                </Badge>
                <div className="text-white text-sm font-medium">
                  {factionEmojis[player.current_faction] || '⚡'} {player.username} - {player.chicken_name || 'GARU CHICK'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{player.avg_wpm || 0} WPM</div>
                <div className="text-xs text-gray-400">{player.total_races} races • {player.xp?.toLocaleString() || 0} XP</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatrixRaceSocketIO() {
  const { data: user } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  // Fetch faction leaderboard data (refreshes every 4 minutes)
  const { data: factionStats } = useQuery({
    queryKey: ['/api/stats/factions'],
    refetchInterval: 4 * 60 * 1000, // 4 minutes
  });

  // Fetch overall leaderboard data (refreshes every 4 minutes)
  const { data: overallLeaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
    refetchInterval: 4 * 60 * 1000, // 4 minutes
  });
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matrixSocket = useMatrixSocketIO({
    userId: user?.id || 0,
    username: user?.username || 'Guest'
  });

  // Calculate typing metrics with improved accuracy
  const calculateWPM = () => {
    if (!startTime || userInput.length === 0) return 0;
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const charactersTyped = userInput.length;
    const wordsTyped = charactersTyped / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / timeElapsed) || 0;
  };

  const calculateAccuracy = () => {
    if (userInput.length === 0) return 100;
    const correctChars = userInput.length - errors;
    return Math.round((correctChars / userInput.length) * 100);
  };

  const calculateProgress = () => {
    if (!matrixSocket.racePrompt) return 0;
    return Math.round((userInput.length / matrixSocket.racePrompt.length) * 100);
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!matrixSocket.raceActive) return;
    
    const value = e.target.value;
    const previousLength = userInput.length;
    const currentLength = value.length;
    
    // Detect suspicious input (large jumps in text length)
    if (currentLength - previousLength > 8) {
      console.warn('Suspicious input detected - possible paste');
      // Prevent the paste by reverting to previous value
      return;
    }
    
    const newChar = value[value.length - 1];
    const expectedChar = matrixSocket.racePrompt[value.length - 1];

    if (newChar && newChar !== expectedChar) {
      setErrors(prev => prev + 1);
    }

    setUserInput(value);
    setCurrentIndex(value.length);

    // Send progress update
    const progress = calculateProgress();
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    matrixSocket.sendProgress(progress, wpm, accuracy);

    // Check if race is complete
    if (value === matrixSocket.racePrompt) {
      matrixSocket.completeRace(wpm, accuracy);
      setIsRacing(false);
    }
  };

  // Handle race start
  useEffect(() => {
    if (matrixSocket.raceActive && !isRacing) {
      setIsRacing(true);
      setStartTime(Date.now());
      setUserInput('');
      setCurrentIndex(0);
      setErrors(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [matrixSocket.raceActive]);

  // Handle race completion - clear text for all players
  useEffect(() => {
    if (!matrixSocket.raceActive && isRacing) {
      // Race has ended, clear all input text
      setIsRacing(false);
      setUserInput('');
      setCurrentIndex(0);
      setErrors(0);
      setStartTime(null);
    }
  }, [matrixSocket.raceActive, isRacing]);

  if (!matrixSocket.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Connecting to Matrix races...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!matrixSocket.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Authenticating with Matrix system...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPromptText = () => {
    if (!matrixSocket.racePrompt) return null;

    return (
      <div className="font-mono text-lg leading-relaxed p-4 bg-gray-800 rounded border border-gray-600 text-white">
        {matrixSocket.racePrompt.split('').map((char, index) => {
          let className = 'text-gray-300';
          if (index < userInput.length) {
            className = userInput[index] === char ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
          } else if (index === currentIndex) {
            className = 'bg-blue-500 text-white animate-pulse';
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white relative"
      style={{
        backgroundImage: `url(${matrixFederationImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Matrix Federation overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-green-900/20 to-cyan-900/30" />
      
      {/* Discord Bot Integration Banner */}
      <div className="relative z-10 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border-b border-indigo-400/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-indigo-200 font-mono text-sm">
                🤖 <span className="text-cyan-300 font-bold">CJSR DISCORD BOT</span>
              </div>
              <div className="text-xs text-indigo-300">
                Share race results automatically to your Discord server
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href="https://discord.gg/UURbrcEvqN" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Community
              </a>
              <button
                onClick={() =>
                  window.open(
                    "https://discord.com/oauth2/authorize?client_id=1377550334389391390&permissions=2048&scope=bot%20applications.commands",
                    "_blank",
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
              >
                <div className="text-sm">📲</div>
                Add Bot
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 via-cyan-300 to-green-500 bg-clip-text font-mono mb-2">
            MATRIX FEDERATION RACES
          </h1>
          <p className="text-green-300 font-mono text-lg">Cross-server multiplayer typing competition</p>
          <div className="text-cyan-400 font-mono text-sm mt-2">
            ⚡ Real-time synchronization across the Matrix network ⚡
          </div>
        </div>



        {/* Players Panel */}
        <Card className="mb-6 bg-black/60 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-transparent bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text font-mono">
              MATRIX OPERATIVES ({matrixSocket.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matrixSocket.players.map((player, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-black/40 border border-green-500/20 rounded-lg backdrop-blur-sm">
                  {/* Player Avatar - Authentic Player Sprite - 2.5x bigger */}
                  <div className="matrix-operative-container relative w-20 h-20 bg-gray-700 rounded border-2 border-gray-600 overflow-visible flex items-center justify-center">
                    <div className="matrix-operative-sprite" style={{ transform: 'scale(2.5) translateX(-8px)', transformOrigin: 'center' }}>
                      <ChickenAvatar 
                        chickenType={player.chickenType || 'html_steve'}
                        jockeyType={player.jockeyType || 'steve'}
                        size="sm"
                        animation="idle"
                        showName={false}
                      />
                    </div>
                    {/* Faction Badge */}
                    <div className="absolute -top-1 -right-1 text-xs font-bold text-yellow-400 bg-gray-800 px-1 rounded z-30">
                      {player.faction}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`${player.isReady ? "bg-green-600" : "bg-gray-600"} text-white`}>
                        {player.faction}
                      </Badge>
                      <span className={`font-semibold ${player.isReady ? "text-green-400" : "text-gray-300"}`}>
                        {player.username}
                      </span>
                      {player.isReady && <span className="text-green-500">✓ READY</span>}
                    </div>
                    
                    {/* Live stats during race */}
                    {matrixSocket.playerProgress[player.username] && (
                      <div className="flex gap-4 text-sm text-gray-400 mt-1">
                        <span>{matrixSocket.playerProgress[player.username].wpm} WPM</span>
                        <span>{matrixSocket.playerProgress[player.username].accuracy}% ACC</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-4">
              <Button 
                onClick={matrixSocket.toggleReady}
                variant={matrixSocket.players.find(p => p.username === user?.username)?.isReady ? "default" : "outline"}
              >
                {matrixSocket.players.find(p => p.username === user?.username)?.isReady ? "Ready!" : "Get Ready"}
              </Button>
              
              <Button 
                onClick={matrixSocket.startRace}
                disabled={!matrixSocket.canStart}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Race ({matrixSocket.readyCount}/2)
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* Animated Race Track */}
        {matrixSocket.raceActive && (
          <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Race Track</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Race Track with Moving Sprites */}
              <div className="relative h-32 bg-gradient-to-r from-green-800 to-green-600 rounded-lg border-2 border-gray-600 overflow-hidden mb-4">
                {/* Track lines */}
                <div className="absolute inset-0 flex flex-col justify-around py-2">
                  {Object.entries(matrixSocket.playerProgress).map(([username, progress], index) => (
                    <div key={username} className="relative h-8 bg-green-700/30 border border-green-600/50 rounded">
                      {/* Authentic Player Sprite Moving - properly sized and positioned */}
                      <div 
                        className="absolute top-0 h-full flex items-center transition-all duration-200 ease-out z-20"
                        style={{ left: `${Math.min(progress.progress, 95)}%` }}
                      >
                        <ChickenAvatar 
                          chickenType={matrixSocket.players.find(p => p.username === username)?.chickenType || 'html_steve'}
                          jockeyType={matrixSocket.players.find(p => p.username === username)?.jockeyType || 'steve'}
                          size="sm"
                          animation="run"
                          showName={false}
                        />
                      </div>
                      {/* Player name label */}
                      <div className="absolute left-2 top-1 text-xs text-white font-bold z-10">
                        {username}
                      </div>
                      {/* Finish line */}
                      <div className="absolute right-0 top-0 h-full w-1 bg-yellow-400 z-5"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Typing Text Display */}
              {renderPromptText()}
              
              {/* Dark Theme Typing Input */}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onPaste={(e) => {
                  e.preventDefault();
                  console.warn('Paste disabled - type manually for fair play');
                }}
                onContextMenu={(e) => {
                  e.preventDefault(); // Disable right-click menu
                }}
                className="w-full mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg font-mono text-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Type the text above..."
                disabled={!matrixSocket.raceActive}
              />
              
              {/* Real-time Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded border border-gray-600">
                  <div className="text-2xl font-bold text-blue-400">{calculateWPM()}</div>
                  <div className="text-gray-400">WPM</div>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-600">
                  <div className="text-2xl font-bold text-green-400">{calculateAccuracy()}%</div>
                  <div className="text-gray-400">Accuracy</div>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-600">
                  <div className="text-2xl font-bold text-purple-400">{calculateProgress()}%</div>
                  <div className="text-gray-400">Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Race Results */}
        {matrixSocket.raceResults.length > 0 && (
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">🏆 Race Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matrixSocket.raceResults.map((result) => (
                  <div key={result.position} className="flex items-center justify-between p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${result.position === 1 ? "bg-yellow-600" : result.position === 2 ? "bg-gray-500" : "bg-orange-600"} text-white text-lg px-3 py-1`}>
                        #{result.position}
                      </Badge>
                      <div className="relative w-16 h-16 bg-gray-700 rounded border border-gray-600 overflow-visible flex items-center justify-center">
                        <div style={{ transform: 'scale(3)', transformOrigin: 'center' }}>
                          <ChickenAvatar 
                            chickenType={matrixSocket.players.find(p => p.username === result.username)?.chickenType || 'html_steve'}
                            jockeyType={matrixSocket.players.find(p => p.username === result.username)?.jockeyType || 'steve'}
                            size="xs"
                            animation="idle"
                            showName={false}
                          />
                        </div>
                      </div>
                      <span className="font-semibold text-white text-lg">{result.username}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{result.wpm} WPM</div>
                      <div className="text-sm text-gray-400">{result.accuracy}% accuracy</div>
                      <div className="text-lg font-semibold text-green-400">
                        +{result.xpEarned || 0} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboards Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FactionWarsLeaderboard factionStats={factionStats} />
          <OverallLeaderboard leaderboard={overallLeaderboard} />
        </div>
      </div>
    </div>
  );
}



