import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMatrixSocket } from '@/hooks/useMatrixSocket';
import { Trophy, Users, Zap } from 'lucide-react';
import matrixFederationBg from '@assets/image_1748543806188.png';

interface MatrixPlayer {
  playerId: string;
  playerName: string;
  progress: number;
  wpm: number;
  accuracy: number;
  position?: number;
  isCurrentUser?: boolean;
}

interface MatrixRaceData {
  roomId: string;
  raceId: string;
  prompt: string;
  faction: string;
  players: MatrixPlayer[];
  status: 'waiting' | 'active' | 'finished';
  startTime?: number;
}

export default function MatrixRace() {
  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ['/api/profile'] });
  
  // Only show loading if actually loading, not if profile is just empty
  if (profileLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>;
  }
  
  const [raceData] = useState<MatrixRaceData>({
    roomId: '!pwLlCTWvrZExnljYey:matrix.org',
    raceId: 'playtest-fire-001',
    prompt: "In war, the way is to avoid what is strong and to strike at what is weak.",
    faction: 'Fire',
    players: [],
    status: 'waiting'
  });

  const [isRacing, setIsRacing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [progress, setProgress] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [connectedPlayers, setConnectedPlayers] = useState<MatrixPlayer[]>([]);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [canStartRace, setCanStartRace] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { toast } = useToast();

  // Text clearing function
  const clearRaceText = () => {
    setCurrentText('');
    setProgress(0);
    setWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setErrorCount(0);
  };

  // Clear text when race ends for any reason
  useEffect(() => {
    if (raceData.status === 'finished' || !isRacing) {
      clearRaceText();
    }
  }, [raceData.status, isRacing]);

  // Matrix socket connection for race events
  const matrixSocket = useMatrixSocket({
    userId: profile?.id || 0,
    username: profile?.username || 'Guest',
    roomId: raceData.roomId,
    onRaceComplete: clearRaceText
  });

  // Real-time player detection and race timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Get Matrix players
      fetch('/api/matrix/get-race-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: raceData.roomId, raceId: raceData.raceId })
      })
      .then(response => response.json())
      .then(data => {
        if (data.players) {
          const playersWithCurrentUser = data.players.map((player: any) => ({
            ...player,
            isCurrentUser: player.playerName === profile.username
          }));
          
          setConnectedPlayers(playersWithCurrentUser);
          
          // Also fetch ready status
          return fetch('/api/matrix/get-ready-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: raceData.roomId })
          });
        }
      })
      .then(response => {
        if (response) {
          return response.json();
        }
        return null;
      })
      .then(readyData => {
        if (readyData?.readyPlayers) {
          setReadyPlayers(readyData.readyPlayers);
          setCanStartRace(readyData.canStartRace);
          setIsPlayerReady(readyData.readyPlayers.includes(profile?.username));
          
          // Show notification when multiple players detected but don't auto-start
          if (data.players.length >= 2 && !isRacing && connectedPlayers.length < 2) {
            toast({
              title: "🎮 Players Detected!",
              description: `${data.players.length} players ready - Click "Start Race" to begin!`,
            });
          }
        }
      })
      .catch(error => console.log('Matrix player detection error:', error));
    }, 3000);

    return () => clearInterval(interval);
  }, [raceData.roomId, raceData.raceId, isRacing, connectedPlayers.length, profile?.username, toast]);

  // Race timer
  useEffect(() => {
    if (isRacing && raceStartTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - raceStartTime) / 1000; // seconds
        const wordsTyped = currentText.trim().split(' ').length;
        const currentWpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
        setWpm(currentWpm);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRacing, raceStartTime, currentText]);

  const handleToggleReady = async () => {
    const newReadyState = !isPlayerReady;
    setIsPlayerReady(newReadyState);
    
    // Send ready state to server
    try {
      const response = await fetch('/api/matrix/toggle-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId: raceData.roomId,
          isReady: newReadyState
        })
      });
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to participate in Matrix races",
          variant: "destructive"
        });
        setIsPlayerReady(false);
        return;
      }
      
      toast({
        title: newReadyState ? "✓ Ready!" : "⏸️ Not Ready",
        description: newReadyState ? "Waiting for other players..." : "Click Ready when you're prepared to race",
      });
    } catch (error) {
      console.log('Ready toggle error:', error);
    }
  };

  const handleStartRace = async () => {
    if (readyPlayers.length < 2) {
      toast({
        title: "Need More Ready Players",
        description: `${readyPlayers.length}/2+ players ready. Wait for more players to click Ready.`,
        variant: "destructive",
      });
      return;
    }

    // Start race for all ready players
    try {
      await fetch('/api/matrix/start-race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: raceData.roomId,
          raceId: raceData.raceId,
          startedBy: profile?.username
        })
      });
    } catch (error) {
      console.log('Race start error:', error);
    }

    setIsRacing(true);
    setRaceStartTime(Date.now());
    setCurrentText('');
    setProgress(0);
    
    toast({
      title: "🏁 Race Started!",
      description: `Racing against ${readyPlayers.length - 1} other players`,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const previousLength = currentText.length;
    
    // Track keystrokes (only count actual typing, not deletions)
    if (value.length > previousLength) {
      const newKeystrokes = totalKeystrokes + (value.length - previousLength);
      setTotalKeystrokes(newKeystrokes);
      
      // Check if the new characters are correct
      let newErrors = errorCount;
      for (let i = previousLength; i < value.length; i++) {
        if (i >= raceData.prompt.length || value[i] !== raceData.prompt[i]) {
          newErrors++;
        }
      }
      setErrorCount(newErrors);
      
      // Calculate real accuracy based on keystrokes vs errors
      const newAccuracy = newKeystrokes > 0 ? Math.round(((newKeystrokes - newErrors) / newKeystrokes) * 100) : 100;
      setAccuracy(newAccuracy);
    }
    
    setCurrentText(value);
    
    // Calculate progress
    const newProgress = Math.min((value.length / raceData.prompt.length) * 100, 100);
    setProgress(newProgress);
    
    // Check for race completion
    if (newProgress >= 100 && isRacing) {
      completeRace();
    }

    // Send progress update to Matrix (throttled)
    if (isRacing && raceStartTime) {
      throttledProgressUpdate(newProgress, wpm, accuracy);
    }
  };

  const throttledProgressUpdate = (() => {
    let lastUpdate = 0;
    return (progress: number, wpm: number, accuracy: number) => {
      const now = Date.now();
      if (now - lastUpdate > 2000) { // Throttle to once every 2 seconds
        lastUpdate = now;
        sendProgressUpdate(progress, wpm, accuracy);
      }
    };
  })();

  const sendProgressUpdate = async (progress: number, wpm: number, accuracy: number) => {
    try {
      await fetch('/api/matrix/send-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: raceData.roomId,
          raceId: raceData.raceId,
          progress,
          wpm,
          accuracy,
          playerName: profile?.username || 'Unknown',
          faction: profile?.current_faction || 'unknown'
        })
      });
    } catch (error) {
      console.log('Progress update error:', error);
    }
  };

  const completeRace = async () => {
    setIsRacing(false);
    
    try {
      const response = await fetch('/api/matrix/race-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: raceData.roomId,
          raceId: raceData.raceId,
          finalWpm: wpm,
          accuracy,
          playerName: profile?.username || 'Unknown',
          faction: profile?.current_faction || 'unknown'
        })
      });
      
      const result = await response.json();
      
      toast({
        title: `🏆 Race Complete!`,
        description: `Finished in ${result.placement} place with ${wpm} WPM!`,
      });
      
      // Clear text after completion
      clearRaceText();
    } catch (error) {
      console.log('Race completion error:', error);
      toast({
        title: "Race Complete!",
        description: `Great job! ${wpm} WPM with ${accuracy}% accuracy`,
      });
      
      // Clear text after completion
      clearRaceText();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mobile backspace properly
    if (e.key === 'Backspace') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start > 0) {
        const newValue = currentText.slice(0, start - 1) + currentText.slice(end);
        setCurrentText(newValue);
        
        // Set cursor position after state update
        setTimeout(() => {
          textarea.setSelectionRange(start - 1, start - 1);
        }, 0);
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${matrixFederationBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      {/* Matrix green circuit overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/15 via-transparent to-green-800/15 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2 font-mono tracking-wider drop-shadow-lg bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
            MATRIX FEDERATION RACES
          </h1>
          <p className="text-green-300/80 text-lg font-mono tracking-wide">Cross-server competitive typing • Federation Protocol Active</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Race Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Race Status */}
          <Card className="p-6 bg-black/85 border-green-500/70 backdrop-blur-sm shadow-2xl shadow-green-500/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-green-300 font-mono tracking-wider">RACE ROOM: {raceData.roomId.split(':')[0]}</h2>
                <p className="text-sm text-green-400/70 font-mono">Race ID: {raceData.raceId}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400 font-mono">{wpm} WPM</div>
                <div className="text-sm text-green-400/70 font-mono">{accuracy}% accuracy</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Race Prompt */}
            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Type this text:</h3>
              <p className="text-lg leading-relaxed font-mono">
                {raceData.prompt.split('').map((char, index) => {
                  const typedChar = currentText[index];
                  let className = 'text-gray-400'; // Untyped text
                  
                  if (index < currentText.length) {
                    if (typedChar === char) {
                      className = 'text-green-400 bg-green-900/30'; // Correct
                    } else {
                      className = 'text-red-400 bg-red-900/30'; // Incorrect
                    }
                  } else if (index === currentText.length) {
                    className = 'text-white bg-blue-500'; // Current cursor position
                  }
                  
                  return (
                    <span key={index} className={className}>
                      {char}
                    </span>
                  );
                })}
              </p>
            </div>
            
            {/* Text Input */}
            <textarea
              value={currentText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={isRacing ? "Start typing here..." : "Click 'Start Race' to begin"}
              disabled={!isRacing}
              className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-lg resize-none focus:outline-none focus:border-primary disabled:opacity-50"
              autoFocus={isRacing}
            />
            
            {/* Race Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                Progress: {Math.round(progress)}% | {readyPlayers.length} ready | {connectedPlayers.length} connected
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleToggleReady}
                  disabled={isRacing}
                  variant={isPlayerReady ? "default" : "outline"}
                  className={isPlayerReady ? 
                    "bg-green-600 hover:bg-green-700 border-green-400 shadow-lg shadow-green-500/30 font-mono tracking-wider" : 
                    "border-green-500 text-green-400 hover:bg-green-600 hover:text-white font-mono tracking-wider transition-all duration-300 shadow-lg shadow-green-500/20"
                  }
                >
                  {isPlayerReady ? '✓ READY' : '⏸️ GET READY'}
                </Button>
                <Button 
                  onClick={handleStartRace}
                  disabled={isRacing || readyPlayers.length < 2}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 border-green-400 shadow-lg shadow-green-500/40 font-mono tracking-wider text-black font-bold transition-all duration-300"
                >
                  {isRacing ? 'RACING...' : `START RACE (${readyPlayers.length}/2)`}
                </Button>
              </div>
            </div>
          </Card>

          {/* Ready System */}
          {readyPlayers.length > 0 && (
            <Card className="p-4 bg-green-900/20 border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-400">Ready:</span>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-400">Players Detected!</span>
                </div>
                <p className="text-yellow-200">
                  {connectedPlayers.length} players ready - Click "Start Race" to begin!
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ready to Race - Only shows players who clicked Ready */}
          <Card className="p-4 bg-green-900/20 border-green-500/30">
            <h3 className="text-lg font-bold text-green-400 mb-4">READY TO RACE ({readyPlayers.length})</h3>
            <div className="space-y-3">
              {connectedPlayers
                .filter(player => player.playerName.toLowerCase() !== 'system' && readyPlayers.includes(player.playerName))
                .map((player, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">{player.playerName}</span>
                    {player.isCurrentUser && <span className="text-xs bg-primary px-2 py-1 rounded">You</span>}
                    <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">✓ READY</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">{player.wpm} WPM</div>
                    <div className="text-xs text-gray-400">{player.progress.toFixed(1)}% complete</div>
                  </div>
                </div>
              ))}
              {readyPlayers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No players ready yet. Click "Get Ready" to prepare for racing!</p>
                </div>
              )}
            </div>
            
            {/* Ready and Start Race Controls */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleToggleReady}
                className={`flex-1 ${
                  isPlayerReady 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                } font-bold transition-all duration-300`}
              >
                {isPlayerReady ? '✓ READY!' : '⏸️ GET READY'}
              </Button>
              
              <Button
                onClick={handleStartRace}
                disabled={!canStartRace || isRacing}
                className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1 transition-all duration-300 disabled:opacity-50"
              >
                START RACE ({readyPlayers.length}/2)
              </Button>
            </div>
          </Card>

          {/* Online Scribes - Shows all connected players */}
          <Card className="p-4 bg-blue-900/20 border-blue-500/30">
            <h3 className="text-lg font-bold text-blue-400 mb-4">ONLINE SCRIBES ({connectedPlayers.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {connectedPlayers.filter(player => player.playerName.toLowerCase() !== 'system').map((player, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">{player.playerName}</span>
                    {player.isCurrentUser && <span className="text-xs bg-primary px-2 py-1 rounded">You</span>}
                    {readyPlayers.includes(player.playerName) && (
                      <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">Ready</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-400">{player.wpm} WPM</div>
                    <div className="text-xs text-gray-400">{player.progress.toFixed(1)}% complete</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Matrix Status */}
          <Card className="bg-dark-800 border-blue-500">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Matrix Federation Active</span>
                </div>
                <div className="text-sm text-gray-400">
                  Connected to matrix.org
                </div>
              </div>
            </div>
          </Card>

          {/* Global CJSR Leaderboard Preview */}
          <GlobalLeaderboardPreview />
        </div>
      </div>


    </div>
    </div>
  );
}

// Component to display real CJSR faction wars and leaderboard data
function GlobalLeaderboardPreview() {
  const [factionStats, setFactionStats] = useState<any>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any>(null);

  // Get data from Matrix socket instead of API
  useEffect(() => {
    // Fetch faction stats
    fetch('/api/stats/factions')
      .then(res => res.json())
      .then(data => setFactionStats(data))
      .catch(err => console.error('Failed to fetch faction stats:', err));

    // Fetch leaderboard
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setGlobalLeaderboard(data))
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  const factionEmojis: { [key: string]: string } = {
    'd2': '💰', 'd4': '🔥', 'd6': '🌱', 'd8': '💨',
    'd10': '⚡', 'd12': '✨', 'd20': '🌊', 'd100': '⚖️'
  };

  const factionNames: { [key: string]: string } = {
    'd2': 'Coin', 'd4': 'Fire', 'd6': 'Earth', 'd8': 'Air',
    'd10': 'Chaos', 'd12': 'Ether', 'd20': 'Water', 'd100': 'Order'
  };

  return (
    <Card className="p-6 bg-gray-900/50 border-purple-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-white">CJSR Global Champions</h3>
        <span className="text-sm text-gray-400">Faction Wars & Top 10</span>
      </div>

      <div className="space-y-6">
        {/* Faction Wars */}
        {factionStats?.factions && factionStats.factions.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">⚔️ Faction Wars</h4>
            <div className="grid grid-cols-2 gap-2">
              {factionStats.factions.slice(0, 8).map((faction: any, index: number) => (
                <div key={faction.faction} className="flex justify-between items-center p-2 bg-gray-800/30 rounded text-xs">
                  <span className="text-white">
                    {factionEmojis[faction.faction]} {factionNames[faction.faction]}
                  </span>
                  <span className="text-green-400">{faction.totalXp?.toLocaleString() || 0} XP</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3">⚔️ Faction Wars</h4>
            <p className="text-gray-400 text-sm">Loading faction data...</p>
          </div>
        )}

        {/* Top Players */}
        {globalLeaderboard?.leaderboard && globalLeaderboard.leaderboard.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3 font-mono tracking-wider">🏆 TOP SCRIBES</h4>
            <div className="space-y-2">
              {globalLeaderboard.leaderboard.slice(0, 6).map((player: any, index: number) => {
                const factionEmoji = factionEmojis[player.current_faction] || '🎯';
                const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4ADE80', '#22C55E', '#16A34A'];
                const rankColor = rankColors[index] || '#16A34A';
                
                return (
                  <div key={player.id} className="flex justify-between items-center p-3 bg-black/40 border border-green-500/30 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-bold font-mono text-sm w-6"
                        style={{ color: rankColor }}
                      >
                        #{index + 1}
                      </span>
                      <span className="text-green-300 font-mono text-sm">
                        {factionEmoji} {player.username} - {player.chicken_name || player.username || 'GARU CHICK'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-green-400 font-bold font-mono text-sm">
                        {Math.round(player.fastest_wpm || player.avg_wpm)} WPM
                      </span>
                      <span className="text-green-400/60 font-mono text-xs">
                        {player.total_races} races • {Math.round(player.xp)} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3 font-mono tracking-wider">🏆 TOP SCRIBES</h4>
            <p className="text-green-400/70 text-sm font-mono">Loading player rankings...</p>
          </div>
        )}
      </div>
    </Card>
  );
}