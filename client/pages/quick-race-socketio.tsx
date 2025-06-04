import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQuickRaceSocketIO } from '@/hooks/useQuickRaceSocketIO';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChickenAvatar } from '@/components/ui/chicken-avatar';

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
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">⚔️ Faction Wars</CardTitle>
        <p className="text-gray-400 text-sm">Updates every 4 minutes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {factionStats.factions.slice(0, 8).map((faction: any, index: number) => (
            <div key={faction.faction} className="flex items-center justify-between p-2 bg-gray-800 border border-gray-600 rounded">
              <div className="flex items-center gap-2">
                <Badge className={`${factionColors[faction.faction as keyof typeof factionColors]} text-white px-2 py-1 text-xs`}>
                  #{index + 1}
                </Badge>
                <div className="text-white text-sm font-medium">
                  {factionNames[faction.faction as keyof typeof factionNames]}
                </div>
              </div>
              <div className="text-white text-xs">
                {faction.total_xp?.toLocaleString() || 0} XP
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Global Leaderboard Component
function GlobalLeaderboard({ leaderboard }: { leaderboard: any }) {
  if (!leaderboard?.leaderboard) return null;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">🏆 Global Leaderboard</CardTitle>
        <p className="text-gray-400 text-sm">Top players by XP</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.leaderboard.slice(0, 10).map((player: any, index: number) => (
            <div key={player.username} className="flex items-center justify-between p-2 bg-gray-800 border border-gray-600 rounded">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-600 text-white px-2 py-1 text-xs">
                  #{index + 1}
                </Badge>
                <div className="text-white text-sm font-medium">
                  {player.username}
                </div>
              </div>
              <div className="text-white text-xs">
                {player.xp?.toLocaleString() || 0} XP
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function QuickRaceSocketIO() {
  const quickRaceSocket = useQuickRaceSocketIO();
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch faction stats and leaderboard
  const { data: factionStats } = useQuery({
    queryKey: ['/api/stats/factions'],
    refetchInterval: 240000 // 4 minutes
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
    refetchInterval: 60000 // 1 minute
  });

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!quickRaceSocket.raceActive || raceFinished) return;

    const value = e.target.value;
    
    // Prevent pasting
    if (value.length - userInput.length > 8) {
      return;
    }

    setUserInput(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      if (!startTime) {
        setStartTime(Date.now());
      }
    }

    // Calculate current character index and check for errors
    let newIndex = 0;
    let newErrors = 0;
    
    for (let i = 0; i < value.length && i < quickRaceSocket.racePrompt.length; i++) {
      if (value[i] === quickRaceSocket.racePrompt[i]) {
        newIndex = i + 1;
      } else {
        newErrors++;
        break;
      }
    }

    setCurrentIndex(newIndex);
    setErrors(newErrors);

    // Calculate WPM and accuracy
    if (startTime && value.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const wordsTyped = newIndex / 5; // standard: 5 characters = 1 word
      const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;
      const currentAccuracy = Math.round(((newIndex) / Math.max(value.length, 1)) * 100);
      
      setWpm(currentWpm);
      setAccuracy(currentAccuracy);

      // Send progress to server
      quickRaceSocket.sendProgress(newIndex / quickRaceSocket.racePrompt.length, currentWpm, currentAccuracy);
    }

    // Check if race is complete
    if (newIndex >= quickRaceSocket.racePrompt.length && !raceFinished) {
      setRaceFinished(true);
      const finalTime = Date.now() - (startTime || Date.now());
      const finalWpm = Math.round((quickRaceSocket.racePrompt.length / 5) / (finalTime / 1000 / 60)) || 0;
      const finalAccuracy = Math.round((newIndex / Math.max(value.length, 1)) * 100);
      
      quickRaceSocket.completeRace(finalWpm, finalAccuracy);
    }
  };

  // Handle paste prevention
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  // Handle right-click prevention
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Auto-start race when enough players join
  useEffect(() => {
    if (quickRaceSocket.players.length >= 1 && !quickRaceSocket.raceActive && !quickRaceSocket.countdownStarted) {
      // Start 3-second countdown
      quickRaceSocket.startCountdown();
    }
  }, [quickRaceSocket.players.length, quickRaceSocket.raceActive, quickRaceSocket.countdownStarted]);

  // Reset state when race starts
  useEffect(() => {
    if (quickRaceSocket.raceActive && !raceFinished) {
      setStartTime(Date.now());
      setUserInput('');
      setCurrentIndex(0);
      setErrors(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [quickRaceSocket.raceActive]);

  if (!quickRaceSocket.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Connecting to Quick Race...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quickRaceSocket.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Authenticating with Quick Race system...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPromptText = () => {
    if (!quickRaceSocket.racePrompt) return null;

    return (
      <div className="font-mono text-lg leading-relaxed p-4 bg-gray-800 rounded border border-gray-600 text-white">
        {quickRaceSocket.racePrompt.split('').map((char, index) => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚡ Quick Race Arena</h1>
          <p className="text-gray-300">Fast-paced races with skill-matched NPCs! Auto-start when players join.</p>
          <div className="mt-4">
            <a 
              href="https://discord.gg/UURbrcEvqN" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord Community
            </a>
          </div>
        </div>

        {/* Players Panel */}
        <Card className="mb-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Racers ({quickRaceSocket.players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickRaceSocket.players.map((player, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                  {/* Player Avatar - 2.5x bigger */}
                  <div className="relative w-20 h-20 bg-gray-700 rounded border-2 border-gray-600 overflow-visible flex items-center justify-center">
                    <div style={{ transform: 'scale(2.5) translateX(-8px)', transformOrigin: 'center' }}>
                      <ChickenAvatar 
                        chickenType={player.chickenType || 'html_steve'}
                        jockeyType={player.jockeyType || 'steve'}
                        size="sm"
                        animation="idle"
                        showName={false}
                      />
                    </div>
                    {/* Faction Badge */}
                    <div className="absolute -top-1 -right-1 text-xs font-bold text-yellow-400 bg-gray-800 px-1 rounded z-10">
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
                      {player.isNPC && <Badge className="bg-purple-600 text-white text-xs">NPC</Badge>}
                    </div>
                    
                    {/* Live stats during race */}
                    {quickRaceSocket.playerProgress[player.username] && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{quickRaceSocket.playerProgress[player.username].wpm} WPM</span>
                          <span>{quickRaceSocket.playerProgress[player.username].accuracy}% ACC</span>
                          <span>{Math.round(quickRaceSocket.playerProgress[player.username].progress * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                            style={{ width: `${quickRaceSocket.playerProgress[player.username].progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Countdown Display */}
        {quickRaceSocket.countdown > 0 && (
          <Card className="mb-6 bg-orange-900 border-orange-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  {quickRaceSocket.countdown}
                </div>
                <p className="text-orange-200">Race starts in...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Race Area */}
        {quickRaceSocket.raceActive && (
          <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Quick Race in Progress</CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="text-yellow-400">WPM: {wpm}</span>
                  <span className="text-green-400">Accuracy: {accuracy}%</span>
                  <span className="text-blue-400">Progress: {Math.round((currentIndex / quickRaceSocket.racePrompt.length) * 100)}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderPromptText()}
                
                {/* Mobile-optimized typing interface */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onContextMenu={handleContextMenu}
                    onTouchStart={() => inputRef.current?.focus()}
                    onClick={() => inputRef.current?.focus()}
                    className="w-full p-3 text-lg bg-gray-800 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-blue-500 touch-manipulation"
                    placeholder="Tap here to start typing..."
                    disabled={!quickRaceSocket.raceActive || raceFinished}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    inputMode="text"
                    enterKeyHint="done"
                  />
                  
                  {/* Mobile instructions */}
                  <div className="text-xs text-gray-400 mt-1 md:hidden">
                    Tap the input field above to open your keyboard
                  </div>
                </div>
                
                {errors > 0 && (
                  <div className="text-red-400 text-sm">
                    Error detected! Press backspace to continue.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waiting for Players */}
        {!quickRaceSocket.raceActive && quickRaceSocket.countdown === 0 && (
          <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  Waiting for Players...
                </div>
                <p className="text-gray-400">Race will auto-start when players join!</p>
                <div className="mt-4">
                  <Button 
                    onClick={quickRaceSocket.toggleReady}
                    className={`${quickRaceSocket.isReady ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    {quickRaceSocket.isReady ? 'Cancel Ready' : 'Get Ready'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Race Results */}
        {quickRaceSocket.raceResults.length > 0 && (
          <Card className="mb-6 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🏁 Race Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickRaceSocket.raceResults.map((result: any, index: number) => {
                  // Use actual XP earned from server data
                  const xpEarned = result.xpEarned || 8;

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-600 text-white">
                          #{result.placement}
                        </Badge>
                        <span className="text-white font-semibold">{result.username}</span>
                        {result.isNPC && <Badge className="bg-purple-600 text-white text-xs">NPC</Badge>}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-300">
                        <span>{result.wpm} WPM</span>
                        <span>{result.accuracy}% ACC</span>
                        {!result.isNPC && <span className="text-green-400 font-semibold">+{xpEarned} XP</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sidebar - Faction Wars and Global Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FactionWarsLeaderboard factionStats={factionStats} />
          <GlobalLeaderboard leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}