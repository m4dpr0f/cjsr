import { useState, useEffect, useRef } from "react";
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
import { VirtualKeyboard } from "@/components/mobile/virtual-keyboard";
import { cn } from "@/lib/utils";

interface EnhancedTypingInterfaceProps {
  prompt: string;
  onProgress: (progress: number) => void;
  onComplete: (stats: { wpm: number; accuracy: number; time: number }) => void;
  isRaceActive: boolean;
  raceStartTime: number | null;
  singlePlayerMode?: boolean;
  onGhostProgress?: (progress: number) => void;
}

export function EnhancedTypingInterface({
  prompt,
  onProgress,
  onComplete,
  isRaceActive,
  raceStartTime,
  singlePlayerMode = false,
  onGhostProgress
}: EnhancedTypingInterfaceProps) {
  const [typed, setTyped] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [error, setError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [ghostWPM] = useState(50); // Default ghost WPM
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [useNativeKeyboard, setUseNativeKeyboard] = useState(true); // Default to using native keyboard
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLDivElement>(null);

  // Detect mobile device on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice || window.innerWidth < 768);
      setViewportHeight(window.innerHeight);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle first keypress to start the timer in single player mode
  const handleFirstKeypress = () => {
    if (singlePlayerMode && !startTime && isRaceActive) {
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

  // Auto-scroll the prompt area when typing reaches bottom of visible area
  useEffect(() => {
    if (textAreaRef.current && typed.length > 0) {
      const highlightedText = textAreaRef.current.querySelector('.bg-secondary\\/30');
      
      if (highlightedText) {
        const highlightBottom = highlightedText.getBoundingClientRect().bottom;
        const textAreaBottom = textAreaRef.current.getBoundingClientRect().bottom;
        const buffer = 40; // px buffer before scrolling
        
        if (highlightBottom > textAreaBottom - buffer) {
          textAreaRef.current.scrollTop += 20; // Scroll by a small amount
        }
      }
    }
  }, [typed]);

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
    if ((!isRaceActive && !singlePlayerMode) || isComplete || isMobile) return;

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
        } else {
          setError(false);
          setTyped((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRaceActive, isComplete, typed, prompt, singlePlayerMode, startTime, isMobile]);

  // Process key input from virtual keyboard
  const handleVirtualKeyPress = (key: string) => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;
    
    // Start timer on first keypress (single player mode)
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
    
    // Process the key input
    // Increment total keypress count for accuracy tracking
    setTotalKeypresses(prev => prev + 1);
    
    const nextChar = normalizeHyphen(prompt[typed.length]);
    const isCorrect = key === nextChar || 
                     (key === '-' && ['—', '–', '−'].includes(prompt[typed.length]));

    if (!isCorrect) {
      setError(true);
      // Count errors for accuracy calculation
      setErrorCount(prev => prev + 1);
    } else {
      setError(false);
      setTyped((prev) => prev + key);
    }
  };
  
  // Handle backspace from virtual keyboard
  const handleVirtualBackspace = () => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;
    
    // Start timer on first interaction (single player mode)
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
    
    setTyped((prev) => prev.slice(0, -1));
    setError(false);
  };
  
  // Handle space from virtual keyboard
  const handleVirtualSpace = () => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;
    
    // Start timer on first interaction (single player mode)
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
    
    // Check if next character is a space
    if (prompt[typed.length] === ' ') {
      setTyped((prev) => prev + ' ');
      setError(false);
      setTotalKeypresses(prev => prev + 1);
    } else {
      setError(true);
      setErrorCount(prev => prev + 1);
      setTotalKeypresses(prev => prev + 1);
    }
  };
  
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
      
      const stats = {
        wpm: currentWpm,
        accuracy: finalAccuracy,
        time: currentTime,
      };
      
      onComplete(stats);
      
      // In single player mode, save stats to localStorage
      if (singlePlayerMode) {
        saveStats({
          wpm: currentWpm,
          accuracy: finalAccuracy,
          racesCompleted: 1
        });
        
        // Calculate and save XP
        const xpGained = calculateXpGained(currentWpm, finalAccuracy);
        const userProgress = getUserProgress();
        saveUserProgress(userProgress.level, userProgress.xp + xpGained);
      }
    }
  }, [typed, currentTime, prompt, isRaceActive, onProgress, onComplete, singlePlayerMode, startTime, totalKeypresses, errorCount]);

  // Auto-focus the input when race becomes active (for desktop)
  useEffect(() => {
    if ((isRaceActive || singlePlayerMode) && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isRaceActive, singlePlayerMode, isMobile]);

  // Toggle keyboard type on mobile
  const toggleKeyboardType = () => {
    if (isMobile) {
      setUseNativeKeyboard(!useNativeKeyboard);
      setShowVirtualKeyboard(false);
      
      // Start timer if not started yet
      if (singlePlayerMode && !startTime) {
        handleFirstKeypress();
      }
    }
  };
  
  // Toggle virtual keyboard on mobile
  const toggleVirtualKeyboard = () => {
    if (isMobile && !useNativeKeyboard) {
      setShowVirtualKeyboard(!showVirtualKeyboard);
      // Start timer if not started yet
      if (singlePlayerMode && !startTime) {
        handleFirstKeypress();
      }
    }
  };
  
  // Handle native keyboard input
  const handleNativeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((!isRaceActive && !singlePlayerMode) || isComplete) return;
    
    // Start timer on first keypress (single player mode)
    if (singlePlayerMode && !startTime) {
      handleFirstKeypress();
    }
    
    const currentValue = e.target.value;
    
    // Clear input after processing
    setTimeout(() => {
      if (e.target) {
        e.target.value = '';
      }
    }, 10);
    
    if (currentValue.length > 0) {
      const newChar = currentValue[currentValue.length - 1];
      
      // Increment total keypress count for accuracy tracking
      setTotalKeypresses(prev => prev + 1);
      
      const nextChar = normalizeHyphen(prompt[typed.length]);
      const isCorrect = newChar === nextChar || 
                       (newChar === '-' && ['—', '–', '−'].includes(prompt[typed.length]));
  
      if (!isCorrect) {
        setError(true);
        // Count errors for accuracy calculation
        setErrorCount(prev => prev + 1);
      } else {
        setError(false);
        setTyped((prev) => prev + newChar);
      }
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
      <div 
        ref={textAreaRef}
        className={cn(
          "bg-light p-3 text-dark leading-relaxed overflow-y-auto",
          isMobile && showVirtualKeyboard ? "h-24" : "h-32"
        )}
        style={{ fontFamily: "'Courier New', monospace", fontSize: "16px" }}
      >
        <span className="bg-secondary/30">{prompt.substring(0, typed.length)}</span>
        <span>{prompt.substring(typed.length)}</span>
      </div>
      
      {/* Typing input area */}
      <div className="relative mt-4">
        <div 
          ref={inputRef}
          onClick={useNativeKeyboard ? () => {} : toggleVirtualKeyboard}
          tabIndex={isMobile && useNativeKeyboard ? -1 : 0}
          className={cn(
            "bg-black/70 border-2 p-3 text-white text-xl cursor-text min-h-[60px]",
            error ? "border-accent animate-pulse" : "border-primary",
            isMobile && "relative"
          )}
          style={{ fontFamily: "'Courier New', monospace", fontSize: "16px" }}
        >
          {typed}
          <span className="typing-cursor"></span>
          
          {/* Mobile keyboard switch button */}
          {isMobile && isRaceActive && !isComplete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleKeyboardType();
              }}
              className="absolute top-2 right-2 z-20 bg-primary/70 text-dark p-1 rounded-md text-xs font-minecraft"
            >
              {useNativeKeyboard ? "Custom ⌨️" : "Native ⌨️"}
            </button>
          )}
          
          {/* Native keyboard input (hidden but functional) */}
          {isMobile && useNativeKeyboard && isRaceActive && !isComplete && (
            <input
              type="text"
              className="opacity-0 absolute inset-0 w-full h-full z-10 cursor-text"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onChange={handleNativeInput}
              autoFocus
            />
          )}
          
          {/* Mobile tap indicator overlay */}
          {isMobile && !useNativeKeyboard && !showVirtualKeyboard && isRaceActive && !isComplete && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
              <p className="text-primary font-minecraft text-center">
                Tap to {startTime ? "show" : "activate"} custom keyboard
              </p>
            </div>
          )}
        </div>
        
        {/* Instructions for native keyboard mode */}
        {isMobile && useNativeKeyboard && isRaceActive && !isComplete && (
          <div className="mt-2 bg-blue-900/40 p-2 rounded-md text-blue-200 text-xs text-center">
            <p>Using your device's native keyboard. Tap above to type.</p>
          </div>
        )}
      </div>
      
      {/* Virtual keyboard for mobile */}
      {isMobile && !useNativeKeyboard && showVirtualKeyboard && isRaceActive && !isComplete && (
        <div className="mt-4">
          <VirtualKeyboard
            onKeyPress={handleVirtualKeyPress}
            onBackspace={handleVirtualBackspace}
            onSpace={handleVirtualSpace}
          />
        </div>
      )}
      
      {/* Stats display */}
      <div className="flex justify-between text-xs mt-4">
        <div className="font-minecraft">
          <span className="text-secondary">WPM: </span>
          <span className="text-primary font-bold">{Math.round(wpm)}</span>
        </div>
        <div className="font-minecraft">
          <span className="text-secondary">Accuracy: </span>
          <span className="text-primary font-bold">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}