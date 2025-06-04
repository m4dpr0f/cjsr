import { useState, useEffect, useCallback, useRef } from "react";
import { EnhancedTypingInterface } from "@/components/ui/enhanced-typing-interface";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getRandomPrompt, getStats } from "@/lib/single-player";
import { getForkState } from "@/lib/fork";
import { getCampaignProgress } from "@/lib/campaigns";
import { PixelButton } from "@/components/ui/pixel-button";
import { ChickenAvatar } from "@/components/ui/chicken-avatar";

interface SinglePlayerRaceProps {
  onRaceComplete?: (stats: { wpm: number; accuracy: number; time: number }) => void;
  onSubmitPrompt?: (prompt: string) => void;
  onBackToMenu?: () => void;
  campaignMode?: boolean;
  campaignPrompt?: string;
  campaignRaceNumber?: number;
  campaignRaceTitle?: string;
}

export function SinglePlayerRace({
  onRaceComplete,
  onSubmitPrompt,
  onBackToMenu,
  campaignMode = false,
  campaignPrompt,
  campaignRaceNumber,
  campaignRaceTitle
}: SinglePlayerRaceProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [playerProgress, setPlayerProgress] = useState(0);
  const [ghostProgress, setGhostProgress] = useState(0);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceComplete, setRaceComplete] = useState(false);
  const [raceStats, setRaceStats] = useState<{ wpm: number; accuracy: number; time: number } | null>(null);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [showRacePrompt, setShowRacePrompt] = useState(true);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [playerName, setPlayerName] = useState("Player 1");
  // Get character information from fork state if in campaign mode
  const [playerCharacter, setPlayerCharacter] = useState<string | null>(null);
  const [playerChickenType, setPlayerChickenType] = useState<string>("html_generic");
  const [playerJockeyType, setPlayerJockeyType] = useState<string>("html_generic");

  // Get a prompt and set player character if in campaign mode
  useEffect(() => {
    if (campaignMode && campaignPrompt) {
      setPrompt(campaignPrompt);
      
      // Check if we're in classic campaign or fork campaign
      if (campaignRaceTitle?.includes("Classic") || campaignRaceTitle?.includes("Steve")) {
        // Classic campaign - Use Steve and Brutus
        setPlayerCharacter("Steve");
        setPlayerChickenType("html_steve");
        setPlayerJockeyType("html_steve");
      } else {
        // Get character selection from fork state
        const forkState = getForkState();
        if (forkState.selectedCharacter) {
          setPlayerCharacter(forkState.selectedCharacter);
          
          // Set appropriate character sprites based on selection
          if (forkState.selectedCharacter === "Matikah") {
            setPlayerChickenType("html_matikah");
            setPlayerJockeyType("html_matikah");
          } else if (forkState.selectedCharacter === "Auto") {
            // Auto's mount evolution: Ember (red) -> Timaru (black with red)
            setPlayerChickenType("html_auto");
            setPlayerJockeyType("auto");
          } else if (forkState.selectedCharacter === "Iam") {
            setPlayerChickenType("html_iam");
            setPlayerJockeyType("html_iam");
          } else if (forkState.selectedCharacter === "Steve") {
            setPlayerChickenType("html_steve");
            setPlayerJockeyType("html_steve");
          }
        }
      }
    } else {
      // Practice mode - always use generic sprites for guests, ignore fork state
      setPrompt(getRandomPrompt());
      setPlayerChickenType("html_generic");
      setPlayerJockeyType("html_generic");
    }
  }, [campaignMode, campaignPrompt]);

  // Handle countdown timer
  useEffect(() => {
    if (countdownActive && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdownActive && countdownValue === 0) {
      setCountdownActive(false);
      setIsRaceActive(true);
      
      // Auto-scroll to race track section when race begins
      setTimeout(() => {
        if (raceTrackRef.current) {
          raceTrackRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 300);
    }
  }, [countdownActive, countdownValue]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleProgress = useCallback((progress: number) => {
    setPlayerProgress(progress);
  }, []);

  const handleGhostProgress = useCallback((progress: number) => {
    setGhostProgress(progress);
  }, []);

  const handleRaceComplete = useCallback((stats: { wpm: number; accuracy: number; time: number }) => {
    setRaceComplete(true);
    setIsRaceActive(false);
    setRaceStats(stats);
    
    if (onRaceComplete) {
      onRaceComplete(stats);
    }
  }, [onRaceComplete]);

  const handleRaceAgain = () => {
    // In campaign mode, we don't change the prompt but keep the campaign one
    if (!campaignMode) {
      setPrompt(getRandomPrompt());
    }
    setPlayerProgress(0);
    setGhostProgress(0);
    setIsRaceActive(false);
    setRaceComplete(false);
    setRaceStats(null);
    setShowPromptInput(false);
    setShowRacePrompt(true);
    setCountdownActive(false);
    setCountdownValue(3);
    // No need to reset playerResponse as we no longer use it
  };

  const handleShowPromptInput = () => {
    setShowPromptInput(true);
  };

  const handleSubmitPrompt = () => {
    if (newPrompt.trim().length >= 50) {
      if (onSubmitPrompt) {
        onSubmitPrompt(newPrompt);
      }
      setShowPromptInput(false);
      handleRaceAgain();
    }
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handlePlayerNameFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Clear default "Player 1" text when input is focused
    if (playerName === "Player 1") {
      setPlayerName("");
    }
  };

  const handleStartRace = () => {
    // Directly start the race without requiring /ready input
    setShowRacePrompt(false);
    setCountdownActive(true);
  };

  // Ref for scrolling to race track section
  const raceTrackRef = useRef<HTMLDivElement>(null);
  const typingInterfaceRef = useRef<HTMLDivElement>(null);
  
  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice || window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Add effect for scrolling and focus mode
  useEffect(() => {
    if (isRaceActive && !showRacePrompt && !raceComplete) {
      // Add a class to the body to enable focus mode
      document.body.classList.add('race-focus-mode');
      
      // On mobile, create a more focused view
      if (isMobile) {
        document.body.classList.add('mobile-race-mode');
      }
      
      // Scroll race track into view with smooth behavior
      if (raceTrackRef.current) {
        raceTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Set up autoscroll to scribing interface after race starts
      const scrollTimeout = setTimeout(() => {
        if (typingInterfaceRef.current) {
          typingInterfaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, isMobile ? 1000 : 1500); // Faster scroll on mobile
      
      return () => {
        clearTimeout(scrollTimeout);
        // Remove focus mode classes when race is over or component unmounts
        document.body.classList.remove('race-focus-mode');
        document.body.classList.remove('mobile-race-mode');
      };
    }
  }, [isRaceActive, showRacePrompt, raceComplete, isMobile]);
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Race initialization prompt */}
      {showRacePrompt ? (
        <div className="bg-dark p-6 minecraft-border">
          <h2 className="font-minecraft text-primary mb-4 text-center">
            {campaignMode ? `RACE ${campaignRaceNumber}: ${campaignRaceTitle}` : "RACE SETUP"}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-minecraft text-secondary mb-2">
              YOUR NAME:
            </label>
            <input 
              type="text"
              className="w-full p-2 bg-black/70 border-2 border-primary text-white"
              value={playerName}
              onChange={handlePlayerNameChange}
              onFocus={handlePlayerNameFocus}
              maxLength={16}
              style={{ fontFamily: "'Courier New', monospace", fontSize: "16px" }}
            />
          </div>
          
          <div className="text-center">
            <PixelButton 
              onClick={handleStartRace}
              size="lg"
            >
              START RACE NOW
            </PixelButton>
          </div>
        </div>
      ) : countdownActive ? (
        <div className="bg-dark p-6 minecraft-border text-center">
          <h2 className="font-minecraft text-primary mb-4">RACE STARTS IN</h2>
          <div className="text-5xl font-minecraft text-secondary animate-bounce-slow">
            {countdownValue}
          </div>
          <div className="mt-4 text-light font-minecraft">
            Get ready to type!
          </div>
        </div>
      ) : null}
      
      {/* Race track display */}
      {!showRacePrompt && (
        <div ref={raceTrackRef} className="bg-dark bg-opacity-90 p-2 minecraft-border" id="race-track-section">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-minecraft text-primary uppercase text-sm">RACE TRACK</h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-xs text-secondary font-minecraft mr-1">WPM</span>
                <span className="text-md text-primary font-minecraft" id="current-wpm">0</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-secondary font-minecraft mr-1">ACCURACY</span>
                <span className="text-md text-primary font-minecraft" id="current-accuracy">100%</span>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-visible mb-2 race-track" 
               style={{ 
                 backgroundImage: `url(${new URL('/src/assets/race-course-background.png', import.meta.url).href})`, 
                 backgroundSize: 'cover', 
                 backgroundPosition: 'center',
                 borderRadius: '4px',
                 border: '2px solid #F9BE2A',
                 boxShadow: '0 0 10px rgba(0,0,0,0.5), inset 0 0 0 2px #3A2E27'
               }}>
            {/* Race graphic */}
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-primary/70 flex items-center justify-center">
              <div className="font-minecraft text-sm text-dark rotate-90">FINISH</div>
            </div>
            
            {/* Ghost progress - TeacherGuru sprite for practice mode, Death for campaign */}
            <div 
              className="absolute top-4 h-12 w-12 transition-all duration-300"
              style={{ left: `${ghostProgress * 0.8}%` }}
            >
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-16 h-16">
                  <ChickenAvatar
                    chickenType={campaignMode ? "html_death" : "html_teacherGuru"}
                    jockeyType={campaignMode ? "html_death" : "html_teacherGuru"}
                    size="md"
                    animation="run"
                    showName={false}
                  />
                </div>
              </div>
              <div className="text-xs font-minecraft text-center text-white bg-black/70 px-1 rounded">
                {campaignMode ? "DEATH" : "TEACHER"}
              </div>
            </div>
            
            {/* Player progress - Use Matikah as default character */}
            <div 
              className="absolute top-20 h-12 w-12 transition-all duration-300"
              style={{ left: `${playerProgress * 0.8}%` }}
            >
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-16 h-16">
                  <ChickenAvatar
                    chickenType={playerChickenType}
                    jockeyType={playerJockeyType}
                    size="md"
                    animation="run"
                    showName={false}
                  />
                </div>
              </div>
              <div className="text-xs font-minecraft text-center text-white bg-black/70 px-1 rounded">{playerName}</div>
            </div>
          </div>
          
          {/* Progress bars */}
          <div className="space-y-0.5">
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-minecraft text-primary text-xs">{playerName}</span>
                <span className="font-minecraft text-xs">{Math.round(playerProgress)}%</span>
              </div>
              <ProgressBar progress={playerProgress} color="#F9BE2A" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-minecraft text-secondary text-xs">GHOST</span>
                <span className="font-minecraft text-xs">{Math.round(ghostProgress)}%</span>
              </div>
              <ProgressBar progress={ghostProgress} color="#36A599" />
            </div>
          </div>
        </div>
      )}
      
      {/* Scribing interface */}
      {!showRacePrompt && !raceComplete ? (
        <div ref={typingInterfaceRef} className="scroll-mt-4" id="scribing-interface-section">
          <EnhancedTypingInterface 
            prompt={prompt}
            onProgress={handleProgress}
            onComplete={handleRaceComplete}
            isRaceActive={isRaceActive}
            raceStartTime={null}
            singlePlayerMode={true}
            onGhostProgress={handleGhostProgress}
          />
        </div>
      ) : raceComplete ? (
        <div className="bg-dark p-6 minecraft-border">
          <h2 className="font-minecraft text-primary mb-4 text-xl text-center">
            {campaignMode ? `RACE ${campaignRaceNumber}: ${campaignRaceTitle}` : "RACE RESULTS"}
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm font-minecraft text-secondary">TIME</div>
              <div className="text-xl font-minecraft text-primary">{raceStats?.time}s</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-minecraft text-secondary">WPM</div>
              <div className="text-xl font-minecraft text-primary">{raceStats?.wpm}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-minecraft text-secondary">ACCURACY</div>
              <div className="text-xl font-minecraft text-primary">{raceStats?.accuracy}%</div>
            </div>
          </div>
          
          {!showPromptInput ? (
            <div className="flex flex-col space-y-2">
              <PixelButton onClick={handleRaceAgain}>
                RACE AGAIN
              </PixelButton>
              <PixelButton onClick={handleShowPromptInput} variant="secondary">
                SUBMIT NEW PROMPT
              </PixelButton>
              {onBackToMenu && (
                <PixelButton onClick={onBackToMenu} variant="outline">
                  {campaignMode ? "BACK TO CAMPAIGN" : "BACK TO MENU"}
                </PixelButton>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-minecraft text-secondary mb-2">
                  SUBMIT A NEW PROMPT (MIN 50 CHARS):
                </label>
                <textarea 
                  className="w-full p-2 bg-black/70 border-2 border-primary text-white font-minecraft"
                  rows={4}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  minLength={50}
                  maxLength={250}
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                ></textarea>
                <div className="text-xs font-minecraft mt-1">
                  {newPrompt.length}/250 Characters
                </div>
              </div>
              
              <div className="flex space-x-2">
                <PixelButton 
                  onClick={handleSubmitPrompt}
                  disabled={newPrompt.trim().length < 50}
                >
                  SUBMIT
                </PixelButton>
                <PixelButton 
                  onClick={() => setShowPromptInput(false)}
                  variant="outline"
                >
                  CANCEL
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      ) : null}
      
      {/* Stats */}
      {(!showRacePrompt || raceComplete) && (
        <div className="bg-dark p-4 minecraft-border">
          <h2 className="font-minecraft text-primary mb-4 uppercase">YOUR STATS</h2>
          
          {/* Display player stats from localStorage */}
          <div className="space-y-2">
            <div className="flex justify-between font-minecraft">
              <span className="text-secondary">RACES:</span>
              <span className="text-primary">{getStats().racesCompleted}</span>
            </div>
            <div className="flex justify-between font-minecraft">
              <span className="text-secondary">AVG WPM:</span>
              <span className="text-primary">{getStats().avgWPM}</span>
            </div>
            <div className="flex justify-between font-minecraft">
              <span className="text-secondary">BEST ACCURACY:</span>
              <span className="text-primary">{getStats().bestAccuracy}%</span>
            </div>
            <div className="flex justify-between font-minecraft">
              <span className="text-secondary">PROMPTS ADDED:</span>
              <span className="text-primary">{getStats().promptsContributed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}