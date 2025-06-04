import { useEffect, useState, useRef } from "react";
import { formatTime } from "@/lib/utils";
import { 
  calculateWPM, 
  calculateAccuracy,
  calculateProgress,
  saveStats,
  calculateXpGained,
  saveUserProgress,
  getUserProgress
} from "@/lib/single-player";
import { apiRequest } from "@/lib/queryClient";

interface TypingInterfaceProps {
  prompt: string;
  onProgress: (progress: number) => void;
  onComplete: (stats: { wpm: number; accuracy: number; time: number }) => void;
  isRaceActive: boolean;
  raceStartTime: number | null;
  singlePlayerMode?: boolean;
  onGhostProgress?: (progress: number) => void;
}

// We're keeping the component name as TypingInterface for now to maintain compatibility
// but we've updated the UI text to use "Scribing" instead
export function TypingInterface({
  prompt,
  onProgress,
  onComplete,
  isRaceActive,
  raceStartTime,
  singlePlayerMode = false,
  onGhostProgress
}: TypingInterfaceProps) {
  const [typed, setTyped] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [error, setError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [ghostWPM] = useState(50); // Default ghost WPM
  const [isMobile, setIsMobile] = useState(false);
  const [virtualKeyboardVisible, setVirtualKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-scroll the prompt area when typing reaches bottom of visible area
  useEffect(() => {
    const promptArea = document.querySelector('.bg-light.overflow-y-auto');
    if (promptArea && typed.length > 0) {
      // Get the highlighted element (the typed text)
      const highlightedText = promptArea.querySelector('.bg-secondary\\/30');
      
      if (highlightedText) {
        // Calculate if we're near the bottom of visible area
        const highlightBottom = highlightedText.getBoundingClientRect().bottom;
        const promptAreaBottom = promptArea.getBoundingClientRect().bottom;
        const buffer = 40; // px buffer before scrolling
        
        if (highlightBottom > promptAreaBottom - buffer) {
          // Need to scroll down
          promptArea.scrollTop += 20; // Scroll by a small amount
        }
      }
    }
  }, [typed]);

  // Handle first keypress to start the timer in single player mode
  const handleFirstKeypress = () => {
    if (singlePlayerMode && !startTime) {
      setStartTime(Date.now());
    }
  };

  // Timer effect
  useEffect(() => {
    // For multiplayer mode
    if (!singlePlayerMode && isRaceActive && raceStartTime) {
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - raceStartTime) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
    
    // For single player mode
    if (singlePlayerMode && startTime) {
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCurrentTime(elapsed);
        
        // Update ghost progress if needed
        if (onGhostProgress) {
          const ghostProgress = (ghostWPM / 60) * 5 * elapsed / prompt.length * 100;
          onGhostProgress(Math.min(100, ghostProgress));
        }
      }, 100);
      
      return () => clearInterval(timerInterval);
    }
  }, [isRaceActive, raceStartTime, singlePlayerMode, startTime, onGhostProgress, ghostWPM, prompt.length]);

  // Normalize hyphens in prompt
  const normalizeHyphen = (char: string): string => {
    // Convert any dash-like character (em dash, en dash) to regular hyphen
    if (char === '—' || char === '–' || char === '−') {
      return '-';
    }
    return char;
  };

  // Keyboard input handler
  useEffect(() => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser quick find when typing apostrophe (') or slash (/)
      if (e.key === "'" || e.key === "/" || e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        
        // If it's apostrophe or slash, we still want to process the character for typing
        if (e.key === "'" || e.key === "/") {
          // Continue with normal character processing
        } else {
          return; // For Tab and Enter, just prevent default and return
        }
      }

      // Start timer on first keypress (single player mode)
      if (singlePlayerMode && !startTime) {
        handleFirstKeypress();
      }

      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        setError(false);
        return;
      }

      if (e.key.length === 1) {
        // Increment total keypress count for accuracy tracking
        setTotalKeypresses(prev => prev + 1);
        
        const nextChar = normalizeHyphen(prompt[typed.length]);
        const isCorrect = e.key === nextChar || 
                          (e.key === '-' && ['—', '–', '−'].includes(prompt[typed.length]));

        if (!isCorrect) {
          setError(true);
          // Count errors for accuracy calculation
          setErrorCount(prev => prev + 1);
          console.log(`Error: typed "${e.key}" instead of "${nextChar}"`);
        } else {
          setError(false);
          setTyped((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRaceActive, isComplete, typed, prompt, singlePlayerMode, startTime]);

  // Keep track of errors
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  
  // Progress calculation
  useEffect(() => {
    if ((!isRaceActive && !singlePlayerMode) || (!startTime && singlePlayerMode)) return;

    // Calculate WPM and accuracy
    const currentWpm = calculateWPM(typed, currentTime || 1);
    
    // Calculate accuracy based on error count
    let currentAccuracy = 100;
    if (totalKeypresses > 0) {
      currentAccuracy = Math.max(0, Math.min(100, Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100)));
    }
    
    setWpm(currentWpm);
    setAccuracy(currentAccuracy);

    // Update DOM elements with current stats for the race display
    const wpmElement = document.getElementById('current-wpm');
    const accuracyElement = document.getElementById('current-accuracy');
    
    if (wpmElement) {
      wpmElement.textContent = Math.round(currentWpm).toString();
    }
    
    if (accuracyElement) {
      accuracyElement.textContent = `${currentAccuracy}%`;
    }
    
    console.log(`Stats: WPM=${currentWpm}, Accuracy=${currentAccuracy}%, Errors=${errorCount}, Total=${totalKeypresses}`);
  

    // Calculate progress
    const progress = calculateProgress(typed, prompt.length);
    onProgress(progress);

    // Check for completion
    if (typed.length === prompt.length) {
      setIsComplete(true);
      
      // Calculate final accuracy based on error count
      let finalAccuracy = 100;
      if (totalKeypresses > 0) {
        finalAccuracy = Math.max(0, Math.min(100, Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100)));
      }
      
      console.log(`Race completed with WPM: ${currentWpm}, Accuracy: ${finalAccuracy}%, Errors: ${errorCount}`);
      
      const stats = {
        wpm: currentWpm,
        accuracy: finalAccuracy,
        time: currentTime,
      };
      
      onComplete(stats);
      
      // In single player mode, save stats to localStorage AND send to profile
      if (singlePlayerMode) {
        saveStats({
          wpm: currentWpm,
          accuracy: finalAccuracy,
          racesCompleted: 1
        });
        
        // Calculate and save XP locally
        const xpGained = calculateXpGained(currentWpm, finalAccuracy);
        const userProgress = getUserProgress();
        saveUserProgress(userProgress.level, userProgress.xp + xpGained);

        // Also send XP to profile for practice races
        setTimeout(async () => {
          try {
            await apiRequest('POST', '/api/stats/update-race', {
              userId: null, // Let server use session userId for authenticated users
              username: 'Player',
              wpm: Math.round(currentWpm),
              accuracy: Math.round(finalAccuracy),
              position: finalAccuracy >= 80 ? 1 : 2, // Good accuracy = 1st place
              totalPlayers: 2, // Practice mode = you vs ghost teacher
              faction: 'd2', // Default faction for practice mode
              charactersTyped: typed.length,
              isNPC: false
            });
            console.log('✅ Practice race stats updated successfully!');
          } catch (error) {
            console.error('Failed to update practice race stats:', error);
          }
        }, 500);
      }
    }
  }, [typed, currentTime, prompt, isRaceActive, onProgress, onComplete, singlePlayerMode, startTime]);

  // Auto-focus the input when race becomes active
  useEffect(() => {
    if ((isRaceActive || singlePlayerMode) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRaceActive, singlePlayerMode]);

  // Handle text input for mobile
  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;
    
    // Start timer on first input in single player mode
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
    
    const currentInput = e.target.value;
    
    // Handle deletion (typing fewer characters than before)
    if (currentInput.length <= typed.length) {
      setTyped(currentInput);
      setError(false);
      return;
    }
    
    // Process the new character
    const newChar = currentInput[currentInput.length - 1];
    const nextChar = normalizeHyphen(prompt[typed.length]);
    
    const isCorrect = newChar === nextChar || 
                      (newChar === '-' && ['—', '–', '−'].includes(prompt[typed.length]));
    
    if (!isCorrect) {
      setError(true);
      // Don't advance if incorrect
    } else {
      setError(false);
      setTyped(currentInput);
    }
  };

  // Handle mobile focus
  const handleMobileFocus = () => {
    setVirtualKeyboardVisible(true);
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
  };
  
  return (
    <div className="bg-dark p-4 minecraft-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-minecraft text-primary uppercase">SCRIBING ARENA</h2>
        <div className="text-primary font-minecraft">
          <span>Time: </span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Prompt display area with highlighted text */}
      <div className="bg-light p-3 text-dark mb-4 h-32 overflow-y-auto leading-relaxed" 
           style={{ fontFamily: "'Courier New', monospace", fontSize: "16px" }}>
        <span className="bg-secondary/30">{prompt.substring(0, typed.length)}</span>
        <span>{prompt.substring(typed.length)}</span>
      </div>
      
      {/* Mobile input (hidden visually but functional) */}
      {isMobile && (
        <input
          ref={textInputRef}
          type="text"
          value={typed}
          onChange={handleMobileInput}
          onFocus={handleMobileFocus}
          onBlur={() => setVirtualKeyboardVisible(false)}
          className="opacity-0 absolute w-full h-12 z-10"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      )}

      {/* Typing input area (visual representation) */}
      <div className="relative">
        <div
          ref={inputRef}
          tabIndex={isMobile ? -1 : 0}
          className={`bg-black/70 border-2 p-3 text-white text-xl ${
            error ? "border-accent" : "border-primary"
          }`}
          style={{ fontFamily: "'Courier New', monospace", fontSize: "16px" }}
          onClick={() => isMobile && textInputRef.current?.focus()}
        >
          {typed}
          <span className="typing-cursor"></span>
          {isMobile && !virtualKeyboardVisible && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-primary font-minecraft">Tap to activate keyboard</p>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs mt-4">
          <div className="font-minecraft">
            <span className="text-secondary">WPM: </span>
            <span className="text-primary font-bold">{wpm}</span>
          </div>
          <div className="font-minecraft">
            <span className="text-secondary">Accuracy: </span>
            <span className="text-primary font-bold">{accuracy}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
