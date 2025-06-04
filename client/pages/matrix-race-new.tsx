import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMatrixSocket } from '@/hooks/useMatrixSocket';
import { Trophy, Users, Zap, Wifi, WifiOff } from 'lucide-react';

export default function MatrixRaceNew() {
  const [isReady, setIsReady] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [racePrompt] = useState("In war, the way is to avoid what is strong and to strike at what is weak.");
  const { toast } = useToast();

  // Get user profile
  const { data: user } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });

  // Initialize socket connection
  const {
    isConnected,
    isAuthenticated,
    readyPlayers,
    connectedPlayers,
    canStartRace,
    raceActive,
    toggleReady,
    startRace,
    sendProgress,
    completeRace
  } = useMatrixSocket({
    userId: user?.id,
    username: user?.username,
    roomId: "matrix-race-room"
  });

  useEffect(() => {
    if (raceActive && !startTime) {
      setStartTime(Date.now());
    }
  }, [raceActive, startTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    setTotalKeystrokes(prev => prev + 1);

    // Calculate accuracy
    const targetText = racePrompt.substring(0, value.length);
    let errors = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        errors++;
      }
    }
    setErrorCount(errors);
    
    const newAccuracy = totalKeystrokes > 0 ? Math.max(0, ((totalKeystrokes - errorCount) / totalKeystrokes) * 100) : 100;
    setAccuracy(newAccuracy);

    // Calculate WPM
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = value.trim().split(' ').length;
      const currentWpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
      setWpm(currentWpm);

      // Send progress update (throttled)
      if (raceActive && currentWpm > 0) {
        const progress = (value.length / racePrompt.length) * 100;
        sendProgress(progress, currentWpm, newAccuracy);
      }
    }

    // Check for race completion
    if (value === racePrompt && raceActive) {
      const finalTime = Date.now();
      const totalTime = (finalTime - (startTime || 0)) / 1000 / 60;
      const words = racePrompt.trim().split(' ').length;
      const finalWpm = totalTime > 0 ? Math.round(words / totalTime) : 0;
      
      completeRace(finalWpm, accuracy);
      
      toast({
        title: "🏁 Race Complete!",
        description: `Finished with ${finalWpm} WPM and ${accuracy.toFixed(1)}% accuracy!`,
      });
    }
  };

  const handleToggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    toggleReady(newReadyState);
  };

  const handleStartRace = () => {
    if (canStartRace) {
      startRace();
    }
  };

  const getHighlightedText = () => {
    const typed = currentInput;
    const target = racePrompt;
    
    let result = '';
    
    for (let i = 0; i < target.length; i++) {
      const char = target[i];
      
      if (i < typed.length) {
        if (typed[i] === char) {
          result += `<span class="text-green-600 bg-green-100">${char}</span>`;
        } else {
          result += `<span class="text-red-600 bg-red-100">${char}</span>`;
        }
      } else {
        result += `<span class="text-gray-400">${char}</span>`;
      }
    }
    
    return result;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="p-8 text-center bg-black/40 border-purple-500/50">
            <h1 className="text-3xl font-bold text-white mb-4">Matrix Race</h1>
            <p className="text-purple-300">Please log in to join Matrix races</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 glitch-text">
            MATRIX RACE
          </h1>
          <p className="text-purple-300 text-lg">
            Real-time multiplayer typing across the Matrix federation
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 p-4 bg-black/40 border-purple-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Wifi className="w-5 h-5" />
                  <span>Connected to Matrix</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <WifiOff className="w-5 h-5" />
                  <span>Connecting...</span>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="text-purple-300">
                  <span>Authenticated as {user.username}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-blue-300">
              <Users className="w-5 h-5" />
              <span>{connectedPlayers.length} players connected</span>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Race Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-black/40 border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">Race Arena</h2>
              
              {/* Race Text Display */}
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-purple-500/30">
                <div 
                  className="text-lg leading-relaxed font-mono"
                  dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                />
              </div>

              {/* Input Area */}
              <div className="mb-6">
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  placeholder={raceActive ? "Type the text above..." : "Race will begin soon..."}
                  disabled={!raceActive}
                  className="w-full h-32 p-4 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 font-mono resize-none focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Race Controls */}
              <div className="flex gap-4">
                {!raceActive && (
                  <>
                    <Button
                      onClick={handleToggleReady}
                      variant={isReady ? "default" : "outline"}
                      className={`${isReady ? 'bg-green-600 hover:bg-green-700' : 'border-purple-500 text-purple-300 hover:bg-purple-600'}`}
                    >
                      {isReady ? 'Ready!' : 'Get Ready'}
                    </Button>
                    
                    <Button
                      onClick={handleStartRace}
                      disabled={!canStartRace}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      Start Race ({readyPlayers.length}/2)
                    </Button>
                  </>
                )}
                
                {raceActive && (
                  <div className="flex items-center gap-4 text-white">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold">RACE IN PROGRESS</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Live Stats */}
            <Card className="p-6 bg-black/40 border-purple-500/50">
              <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-300">WPM:</span>
                  <span className="text-white font-mono">{wpm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Accuracy:</span>
                  <span className="text-white font-mono">{accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Progress:</span>
                  <span className="text-white font-mono">
                    {Math.round((currentInput.length / racePrompt.length) * 100)}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Ready Players */}
            <Card className="p-6 bg-black/40 border-purple-500/50">
              <h3 className="text-xl font-bold text-white mb-4">Ready Players</h3>
              <div className="space-y-2">
                {readyPlayers.map((playerName, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">{playerName}</span>
                  </div>
                ))}
                {readyPlayers.length === 0 && (
                  <p className="text-gray-400">No players ready yet</p>
                )}
              </div>
            </Card>

            {/* Connected Players */}
            <Card className="p-6 bg-black/40 border-purple-500/50">
              <h3 className="text-xl font-bold text-white mb-4">Connected Players</h3>
              <div className="space-y-2">
                {connectedPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white">{player.username}</span>
                    {player.progress && (
                      <span className="text-purple-300 text-sm">
                        {Math.round(player.progress)}%
                      </span>
                    )}
                  </div>
                ))}
                {connectedPlayers.length === 0 && (
                  <p className="text-gray-400">No other players connected</p>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}